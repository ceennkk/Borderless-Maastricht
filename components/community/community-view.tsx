"use client";

import { MessageSquare, ThumbsUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FAKE_POSTS = [
  {
    id: "1",
    author: "Sarah V.",
    initials: "SV",
    role: "Cross-border Commuter",
    time: "2 hours ago",
    content: "Pro-tip for Aachen commuters: The Arriva bus 350 subscription can be partially reimbursed by your Dutch employer under the WKR (Werkkostenregeling). Just talked to my HR and got it approved!",
    likes: 24,
    comments: 5,
    category: "Tips & Tricks",
  },
  {
    id: "2",
    author: "Max M.",
    initials: "MM",
    role: "Living in NL, Working in DE",
    time: "5 hours ago",
    content: "Has anyone recently registered a car imported from Germany to the Netherlands? How long did the RDW appointment take? Need to know if I should take a full day off work.",
    likes: 8,
    comments: 12,
    category: "Questions",
  },
  {
    id: "3",
    author: "Lisa B.",
    initials: "LB",
    role: "Student Worker",
    time: "1 day ago",
    content: "Just successfully claimed my double taxation relief! If anyone needs help understanding how to declare their student job income in the German 'Einkommensteuererklärung' while living in Maastricht, let me know.",
    likes: 45,
    comments: 18,
    category: "Success Stories",
  },
  {
    id: "4",
    author: "Thomas K.",
    initials: "TK",
    role: "Living in BE, Working in NL",
    time: "2 days ago",
    content: "Quick question about health insurance: If I live in Belgium but work in the Netherlands, I have the CZ treaty policy (Verdragspolis). Do I get my European Health Insurance Card from CZ or from my Belgian mutuelle?",
    likes: 4,
    comments: 3,
    category: "Questions",
  }
];

export function CommunityView() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Community" 
        action={
          <Button>
            New Post
          </Button>
        }
      />

      <div className="grid gap-6">
        {FAKE_POSTS.map((post) => (
          <Card key={post.id} className="p-5 sm:p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                {post.initials}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{post.author}</p>
                    <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {post.role} · {post.time}
                  </p>
                </div>
                
                <p className="text-sm leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-2 text-muted-foreground">
                  <button className="flex items-center gap-2 text-xs font-medium hover:text-primary transition-colors">
                    <ThumbsUp className="size-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-medium hover:text-primary transition-colors">
                    <MessageSquare className="size-4" />
                    {post.comments}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
