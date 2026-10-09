import networkx as nx
from typing import Any

def build_threat_relationship_graph(threats: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Constructs a NetworkX graph connecting threats via shared infrastructure (IP, ASN, Registrar, SSL).
    Performs community/cluster analysis to uncover hidden threat campaigns and calculates centrality.
    """
    G = nx.Graph()

    # Track infrastructure mappings to find co-occurrences
    ip_to_threats = {}
    registrar_to_threats = {}
    ssl_to_threats = {}
    asn_to_threats = {}

    # 1. Add Threat nodes
    for t in threats:
        t_id = f"threat_{t['id']}"
        G.add_node(
            t_id,
            node_type="threat",
            label=t["domain"] or t["title"],
            title=t["title"],
            threat_id=t["id"],
            risk_score=t["risk_score"],
            severity=t["severity"],
            threat_type=t["threat_type"],
            indicator=t["indicator_value"],
            is_sample=t.get("is_sample", False)
        )

        # Index shared infrastructure
        ip = (t.get("ip_address") or "").strip()
        if ip and ip != "Unknown IP":
            ip_to_threats.setdefault(ip, []).append(t)

        reg = (t.get("registrar") or "").strip()
        if reg and reg != "Unknown Registrar":
            registrar_to_threats.setdefault(reg, []).append(t)

        ssl = (t.get("ssl_issuer") or "").strip()
        if ssl and ssl != "Unknown SSL":
            ssl_to_threats.setdefault(ssl, []).append(t)

        asn = (t.get("asn") or "").strip()
        if asn and asn != "Unknown ASN":
            asn_to_threats.setdefault(asn, []).append(t)

    # 2. Add Infrastructure nodes and edges
    # Shared IPs (strong correlation)
    for ip, member_threats in ip_to_threats.items():
        ip_node = f"ip_{ip}"
        G.add_node(ip_node, node_type="infrastructure_ip", label=f"IP: {ip}", value=ip)
        for mt in member_threats:
            G.add_edge(
                f"threat_{mt['id']}",
                ip_node,
                relationship="HOSTED_ON",
                evidence=f"Threat resolves to IP address {ip}",
                weight=3
            )

    # Shared Registrars (contextual correlation)
    for reg, member_threats in registrar_to_threats.items():
        if len(member_threats) >= 2:  # Only add shared registrars to keep graph clean and high-signal
            reg_node = f"reg_{reg}"
            G.add_node(reg_node, node_type="infrastructure_registrar", label=f"Registrar: {reg}", value=reg)
            for mt in member_threats:
                G.add_edge(
                    f"threat_{mt['id']}",
                    reg_node,
                    relationship="REGISTERED_VIA",
                    evidence=f"Domain registered through {reg}",
                    weight=1
                )

    # Shared SSL Certificates
    for ssl, member_threats in ssl_to_threats.items():
        if len(member_threats) >= 2 and "Let's Encrypt" not in ssl:  # Specific certificate authorities
            ssl_node = f"ssl_{ssl[:20]}"
            G.add_node(ssl_node, node_type="infrastructure_ssl", label=f"SSL: {ssl[:25]}", value=ssl)
            for mt in member_threats:
                G.add_edge(
                    f"threat_{mt['id']}",
                    ssl_node,
                    relationship="SECURED_BY",
                    evidence=f"Shares TLS Certificate issued by {ssl}",
                    weight=2
                )

    # 3. Calculate NetworkX Centrality & Graph Metrics
    degree_cent = nx.degree_centrality(G) if len(G) > 0 else {}
    betweenness_cent = nx.betweenness_centrality(G) if len(G) > 0 else {}

    # 4. Discover Threat Campaigns (Connected Components)
    connected_components = list(nx.connected_components(G))
    campaigns = []
    
    # Assign cluster / campaign IDs to connected subgraphs that have multiple threats
    campaign_idx = 1
    for comp in connected_components:
        comp_threats = [node for node in comp if G.nodes[node].get("node_type") == "threat"]
        if len(comp_threats) >= 2:
            campaign_id = f"CAMPAIGN-SYNDICATE-{campaign_idx:02d}"
            threat_details = []
            shared_ips = set()
            shared_registrars = set()

            for t_node in comp_threats:
                nd = G.nodes[t_node]
                threat_details.append({
                    "id": nd.get("threat_id"),
                    "title": nd.get("title"),
                    "domain": nd.get("label"),
                    "risk_score": nd.get("risk_score"),
                    "severity": nd.get("severity")
                })
                # Check neighbors for shared infra
                for neighbor in G.neighbors(t_node):
                    n_data = G.nodes[neighbor]
                    if n_data.get("node_type") == "infrastructure_ip":
                        shared_ips.add(n_data.get("value"))
                    elif n_data.get("node_type") == "infrastructure_registrar":
                        shared_registrars.add(n_data.get("value"))

            avg_risk = round(sum(td["risk_score"] for td in threat_details) / len(threat_details), 1)

            # Build explainable campaign reason
            reasons = []
            if shared_ips:
                reasons.append(f"Shared bulletproof host infrastructure: {', '.join(list(shared_ips)[:2])}")
            if shared_registrars:
                reasons.append(f"Identical registrar syndication: {', '.join(list(shared_registrars)[:2])}")
            if not reasons:
                reasons.append("Correlated naming taxonomy and coordinated timeline deployment.")

            campaigns.append({
                "campaign_id": campaign_id,
                "threat_count": len(threat_details),
                "threats": threat_details,
                "shared_ips": list(shared_ips),
                "shared_registrars": list(shared_registrars),
                "average_risk": avg_risk,
                "severity": "Critical" if avg_risk >= 75 else "High",
                "evidence_rationale": " | ".join(reasons)
            })
            campaign_idx += 1

    # Format nodes and links for UI visualization
    nodes_out = []
    for node_id, data in G.nodes(data=True):
        nodes_out.append({
            "id": node_id,
            "label": data.get("label", node_id),
            "type": data.get("node_type", "unknown"),
            "risk_score": data.get("risk_score", 0),
            "severity": data.get("severity", "Normal"),
            "threat_id": data.get("threat_id"),
            "degree_centrality": round(degree_cent.get(node_id, 0), 3),
            "betweenness_centrality": round(betweenness_cent.get(node_id, 0), 3)
        })

    links_out = []
    for u, v, data in G.edges(data=True):
        links_out.append({
            "source": u,
            "target": v,
            "relationship": data.get("relationship", "CONNECTED"),
            "evidence": data.get("evidence", "Shared infrastructure pivot"),
            "weight": data.get("weight", 1)
        })

    return {
        "nodes": nodes_out,
        "links": links_out,
        "campaigns": campaigns,
        "summary": {
            "total_nodes": G.number_of_nodes(),
            "total_links": G.number_of_edges(),
            "detected_campaigns_count": len(campaigns),
            "connected_components_count": len(connected_components)
        }
    }
