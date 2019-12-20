export default function detection (agent) {
  let comp_agent = agent.indexOf("web0s") !== -1 || agent.indexOf("lg") !== -1 ;
  if (comp_agent) {
    console.info ("[LG web0s detection] detected");
  }
  return comp_agent;
}
