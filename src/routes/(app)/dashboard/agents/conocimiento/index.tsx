import { routeLoader$ } from "@builder.io/qwik-city";

export const useRedirectLoader = routeLoader$((requestEvent) => {
  throw requestEvent.redirect(302, "/dashboard/agents?view=conocimiento");
});

export default function AgentsKnowledgeRedirect() {
  return null;
}
