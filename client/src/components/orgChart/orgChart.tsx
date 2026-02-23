import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/store";
import { useMyManager } from "@/hooks/orgChart/org.hooks";
import { OrganizationChart } from 'primereact/organizationchart';
import { Card, CardContent } from "@/components/ui/card";
import { orgService } from "@/services/organizationService";

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

type TreeNode = {
  label: string;
  expanded?: boolean;
  data: OrgNode;
  children?: TreeNode[];
  className?: string;
  selectable?: boolean;
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

const OrgNodeComponent = ({ 
  node, 
  onExpand 
}: { 
  node: OrgNode;
  onExpand?: () => void;
}) => {
  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onExpand}
    >
      <CardContent className="p-4 text-center">
        <div className="font-semibold text-base mb-2 text-gray-800">
          {node.name}
        </div>
        <div className="text-sm text-gray-600 mb-1">{node.role}</div>
        <div className="text-xs text-gray-500">{node.email}</div>
      </CardContent>
    </Card>
  );
};

const OrgChartComponent = () => {
  const user = useAuth((state) => state.auth.user);
  const { data: managerData } = useMyManager();
  const [chartData, setChartData] = useState<TreeNode[]>([]);
  const [loadedNodes, setLoadedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const rootNode: OrgNode = {
      id: user.id!,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email || "No Mail",
      role: user.role || "No Role",
      reports_to: null,
    };

    const managerNode = managerData ? mapToOrgNode(managerData) : null;

    const buildInitialTree = (): TreeNode[] => {
      const userTreeNode: TreeNode = {
        label: rootNode.name,
        data: rootNode,
        expanded: false,
        selectable: true,
      };

      if (managerNode) {
        const managerTreeNode: TreeNode = {
          label: managerNode.name,
          data: managerNode,
          expanded: true,
          selectable: true,
          children: [userTreeNode],
        };
        return [managerTreeNode];
      }

      return [userTreeNode];
    };

    const tree = buildInitialTree();
    setChartData(tree.filter(Boolean));
  }, [user, managerData]);

  const loadChildren = async (nodeId: string) => {
    if (loadedNodes.has(nodeId)) return;

    try {

      const response = await orgService.getNextLayer(nodeId);
      
      if (response.success && response.data && response.data.length > 0) {

        const children = response.data.map(mapToOrgNode).filter((node): node is OrgNode => node !== null);

        setChartData((prevData) => {
          
          const updateNode = (nodes: TreeNode[]): TreeNode[] => {
            
            return nodes.map((node) => {

              if (!node || !node.data) return node;
              
              if (node.data.id === nodeId) {
                return {
                  ...node,
                  expanded: true,
                  selectable: true,
                  children: children.map((child) => ({
                    label: child.name,
                    data: child,
                    expanded: false,
                    selectable: true,
                  })),
                };
              }

              if (node.children && node.children.length > 0) {
                return {
                  ...node,
                  children: updateNode(node.children),
                };
              }

              return node;
            
            }).filter(Boolean);
          };

          return updateNode(prevData);
        });

        setLoadedNodes((prev) => new Set(prev).add(nodeId));
      }
    } catch (error) {
      console.error("Failed to load children:", error);
    }
  };

  const nodeTemplate = (node: TreeNode) => {
    if (!node || !node.data) return null;
    
    return (
      <OrgNodeComponent 
        node={node.data} 
        onExpand={() => loadChildren(node.data.id)}
      />
    );
  };

  if (!user) return null;

  return (
    <div className="w-full h-full overflow-scroll bg-gray-50">
      <div className="flex justify-center">
        {chartData && chartData.length > 0 && (
          <OrganizationChart 
            value={chartData} 
            nodeTemplate={nodeTemplate}
          />
        )}
      </div>
    </div>
  );
};

export default OrgChartComponent;
