export default function detection (agent) {
  let comp_agent = agent.indexOf("android") !== -1;
  if (comp_agent) {
    console.info ("[android detection] detected");
  }
  return comp_agent;
}
