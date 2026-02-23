import type { components } from "@/types/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

type Schemas = components["schemas"]

export const leafCard = (data: Schemas["UserDetailResponse"]) => {

    return (
        <Card key={data.id}>
            <CardTitle>{data.first_name} {data.last_name}</CardTitle>
            <CardDescription>{data.id}</CardDescription>
            <CardContent>
                <div>
                    <p className="text-sm text-shadow-muted">
                        {data.email}
                    </p>
                    <p className="text-sm text-shadow-muted">
                        {data.role}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}