"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"
import { Bell, Briefcase, CreditCard, Activity, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Success",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Failed",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Renders</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,405</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,210</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Render Statistics</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                 <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Activity /> Organization Activity</CardTitle>
            <CardDescription>A feed of recent events in your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/user1/40/40" alt="Avatar" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">Olivia Martin</p>
                <p className="text-sm text-muted-foreground">
                  Rendered a kitchen scene. <span className="font-medium text-foreground">#RND-8219</span>
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">5m ago</div>
            </div>
             <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/user2/40/40" alt="Avatar" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">Jackson Lee</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded new tile collection <span className="font-medium text-foreground">"Terra Cotta"</span>
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">1h ago</div>
            </div>
             <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/seed/user3/40/40" alt="Avatar" />
                <AvatarFallback>SN</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium">Sofia Nguyen</p>
                <p className="text-sm text-muted-foreground">
                  Credit top-up of 500.
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">2h ago</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View All</Button>
          </CardFooter>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bell /> Credit Balance Alerts</CardTitle>
            <CardDescription>Users with low credit balance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user4/40/40" alt="Avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">John Doe</p>
                        <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <div className="ml-auto font-medium"><Badge variant="destructive">5 Credits</Badge></div>
                    <Button variant="outline" size="sm" className="ml-4">Add Credits</Button>
                </div>
                <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user5/40/40" alt="Avatar" />
                        <AvatarFallback>AW</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Alice Wonders</p>
                        <p className="text-sm text-muted-foreground">alice.w@example.com</p>
                    </div>
                    <div className="ml-auto font-medium"><Badge variant="destructive">12 Credits</Badge></div>
                     <Button variant="outline" size="sm" className="ml-4">Add Credits</Button>
                </div>
            </div>
        </CardContent>
       </Card>

    </div>
  )
}
