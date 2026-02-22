import { useState } from "react";
import { useAuth } from "@/store";
import { useNextLayer } from "@/hooks/orgChart/org.hooks";

type ApiOrgUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  reports_to?: string;
};

export type OrgNode = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  reports_to?: string | null;
};

const mapToOrgNode = (user: ApiOrgUser): OrgNode | null => {
  if (!user.id) return null;

  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
    reports_to: user.reports_to ?? null,
  };
};

const OrgNodeComponent = ({ node }: { node: OrgNode }) => {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useNextLayer(node.id);

  const children =
    data?.map(mapToOrgNode).filter(Boolean) as OrgNode[] | undefined;

  return (
    <div style={{ textAlign: "center", margin: "10px" }}>
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          cursor: "pointer",
          background: "#fff",
          minWidth: "180px",
        }}
      >
        <strong>{node.name}</strong>
        <div style={{ fontSize: 12 }}>{node.role}</div>
        <div style={{ fontSize: 12, color: "#777" }}>{node.email}</div>
      </div>

      {expanded && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
            gap: "20px",
          }}
        >
          {isLoading && <div>Loading...</div>}

          {children?.map((child) => (
            <OrgNodeComponent key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChartComponent = () => {

  const user = useAuth((state) => state.auth.user);

  if (!user) return null;

  const rootNode: OrgNode = {
    id: user.id!,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email || "No Mail",
    role: user.role || "No Role",
    reports_to: null,
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <OrgNodeComponent node={rootNode} />
    </div>
  );
};

export default OrgChartComponent;
