export default function detection (agent) {
  let comp_agent = agent.indexOf("hisense") !== -1;
  if (comp_agent) {
    console.info ("[Hisense detection] detected");
  }
  return comp_agent;
}
