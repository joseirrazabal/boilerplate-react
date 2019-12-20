export default function detection (agent) {
  let comp_agent = agent.indexOf("playstation 4") !== -1;
  if (comp_agent) {
    console.info ("[PS4 detection] detected");
  }
  return comp_agent;
}
