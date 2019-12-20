export default function detection (agent) {
  let comp_agent = agent.indexOf("stbhuawei") !== -1;
  if (comp_agent) {
    console.info ("[stbhuawei detection] detected");
  }
  return comp_agent;
}
