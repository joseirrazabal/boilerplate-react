export default function detection (agent) {
  let comp_agent = agent.indexOf("opera") !== -1;
  if (comp_agent) {
    console.info ("[opera detection] detected");
  }
  return comp_agent;
}
