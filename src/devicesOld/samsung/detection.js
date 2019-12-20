export default function detection (agent) {
  let comp_agent = agent.indexOf("maple") !== -1;
  if (comp_agent) {
    console.info ("[samsung orsay detection] detected");
  }
  return comp_agent;
}
