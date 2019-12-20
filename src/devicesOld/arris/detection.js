export default function detection (agent) {
  let comp_agent = agent.indexOf("chrome") !== -1;
  if (comp_agent) {
    console.info ("[arris detection] detected");
  }
  return comp_agent;
}
