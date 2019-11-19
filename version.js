#!/usr/bin/env node

var exec = require('child_process').exec,
	// moment = require("moment"),
	fs = require('fs')

function setVersion(newVersion) {
	return new Promise(function(fulfill, reject) {
		exec(
			`sed -i 's#\"version\": \"${process.env.npm_package_version}\"#\"version\": \"${newVersion}\"#' package.json`,
			function(err, stdout, stderr) {
				if (err) reject(err)
				fulfill()
			}
		)
	})
}

// var result = {
//   timestamp: moment().format("DD-MM-YYYY HH:mm")
// };

var version_package = process.env.npm_package_version
var aVersion = version_package.split('.')

var major, minor, patch
major = parseInt(aVersion[0])
minor = parseInt(aVersion[1])
patch = parseInt(aVersion[2]) + 1

if (patch > 9) {
	patch = 0
	minor++
}
if (minor > 9) {
	minor = 0
	major++
}

version_final = `${major}.${minor}.${patch}`

setVersion(version_final).then(() => {
	console.log('version change')
})
