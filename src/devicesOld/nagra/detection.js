export default function detection (agent) {
  let comp_agent = agent.indexOf("opentv5") !== -1;
  if (comp_agent) {
    console.info ("[nagra detection] detected");
  }
  return comp_agent;
}
