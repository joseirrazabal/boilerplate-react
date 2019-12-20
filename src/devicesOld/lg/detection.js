export default function detection (agent) {
  let comp_agent = (agent.indexOf("netcast") !== -1 && agent.indexOf("web0s") === -1);
  if (comp_agent) {
    console.info ("[LG detection] detected");
  }
  return comp_agent;
}
