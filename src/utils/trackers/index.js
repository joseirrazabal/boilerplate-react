import AkamaiTracker from './AkamaiTracker';

try {
  console.log("Tracking: Loading script for akamai tracker");
  AkamaiTracker.loadScript().then(() => {
    console.log("Tracking: loaded script for akamai tracker");
  });
} catch(e) {
 console.error("Could not load script for akamai tracker");
}



