import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { MessagesSquare } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

export default function Groups() {
  return (
    <AppLayout>
      <div className="px-4 py-24 flex items-center justify-center" style={{ background: LIGHT_BLUE, minHeight: "calc(100vh - 16rem)" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(63,167,150,0.12)" }}>
            <MessagesSquare className="w-10 h-10" style={{ color: TEAL }} />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3" style={{ color: NAVY }}>Discussion Forum</h1>
          <p className="text-base mb-8" style={{ color: "#4A5568" }}>
            A space for the Parivaar to share ideas, ask questions, and collaborate is on its way. Coming soon!
          </p>
          <Link href="/parivaar">
            <Button className="rounded-full font-semibold text-white px-6" style={{ background: TEAL, border: "none" }}>
              Explore Our Parivaar
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
