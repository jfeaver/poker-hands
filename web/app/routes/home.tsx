import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Poker Hands" },
    { name: "description", content: "Which poker player won the pot?" },
  ];
}

export default function Home() {
  return <Welcome />;
}
