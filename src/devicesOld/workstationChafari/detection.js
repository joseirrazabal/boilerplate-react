export default function detection (agent) {
  let comp_agent = agent.indexOf("safari") !== -1 && agent.indexOf("chrome") === -1 &&  agent.indexOf("chromium") === -1;
  if (comp_agent) {
    console.info ("[Chafari detection] detected");
  }
  return comp_agent;
}
