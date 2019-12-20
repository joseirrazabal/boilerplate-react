export default function detection (agent) {
  let comp_agent = agent.indexOf("stbcoship") !== -1;
  if (comp_agent) {
    console.info ("[stbcoship detection] detected");
  }
  return comp_agent;
}
