export default function detection (agent) {
  let comp_agent = agent.indexOf("polaroid") !== -1;
  if (comp_agent) {
    console.info ("[polaroid detection] detected");
  }
  return comp_agent;
}
