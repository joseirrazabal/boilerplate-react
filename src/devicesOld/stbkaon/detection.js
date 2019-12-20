export default function detection (agent) {
  let comp_agent = agent.indexOf("stbkaon") !== -1;
  if (comp_agent) {
    console.info ("[stbkaon detection] detected");
  }
  return comp_agent;
}
