export default function detection (agent) {
  let comp_agent = agent.indexOf("sony") !== -1;
  if (comp_agent) {
    console.info ("[sony detection] detected");
  }
  return comp_agent;
}
