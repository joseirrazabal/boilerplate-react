export default function detection (agent) {
  let comp_agent = agent.indexOf("tizen") !== -1;
  if (comp_agent) {
    console.info ("[tizen detection] detected");
  }
  return comp_agent;
}
