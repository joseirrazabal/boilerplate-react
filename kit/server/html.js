import React from 'react'
import PropTypes from 'prop-types'
import { dom } from '@fortawesome/fontawesome-svg-core'

const GTM_ID = process.env.GTM_ID

const Html = ({ html, head, material, loadableState, apolloState }) => {
	return (
		<html lang='es'>
			<head>
				{head.title.toComponent()}
				{head.meta.toComponent()}
				{head.link.toComponent()}

				{/* font-awesome */}
				<style
					dangerouslySetInnerHTML={{
						__html: dom.css()
					}}
				/>

				{loadableState.getLinkElements()}

				{loadableState.getStyleElements()}
				{/* <noscript id='deferred-styles'>{loadableState.getStyleElements()}</noscript> *}

				{/* Google Tag Manager */}
				{GTM_ID && (
					<script
						charSet='UTF-8'
						dangerouslySetInnerHTML={{
							__html:
								`
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer', '` +
								GTM_ID +
								`');
              `
						}}
					/>
				)}
				{/* End Google Tag Manager */}

				<style
					id='styleServer'
					dangerouslySetInnerHTML={{
						__html: material
					}}
				/>
			</head>
			<body>
				{/* Google Tag Manager (noscript) */}
				{GTM_ID && (
					<noscript
						charSet='UTF-8'
						dangerouslySetInnerHTML={{
							__html: `
                  <iframe
                    src='https://www.googletagmanager.com/ns.html?id=${GTM_ID}'
                    height="0"
                    width="0"
                    style="display:none;visibility:hidden"></iframe>
                `
						}}
					/>
				)}
				{/* End Google Tag Manager (noscript) */}

				{/* Boton de el sitio ha sido actualizado */}
				<script
					charSet='UTF-8'
					dangerouslySetInnerHTML={{
						__html: `
           function showRefreshUI(registration) {
								// TODO: Display a toast or refresh UI.
								// This demo creates and injects a button.
								var button = document.createElement('button');
								button.style.position = 'fixed';
                button.style.cursor = 'pointer';
								button.style.bottom = '0';
								button.style.left = '0';
                button.style.border = 'none';
                button.style.fontSize = '13px';
                button.style.background = 'rgba(0,0,0,.8)';
                button.style.color = 'white';
                button.style.width = '100%';
                button.style.right = '0';
                button.style.padding = '25px 0';
								button.style.zIndex = 10;
								button.textContent = 'Este sitio se ha actualizado. Por favor, haga clic para ver los cambios.';

								button.addEventListener('click', function() {
									if (!registration.waiting) {
										// Just to ensure registration.waiting is available before
										// calling postMessage()
										return;
									}

									button.disabled = true;

									registration.waiting.postMessage('skipWaiting');
								});

								document.body.appendChild(button);
							};

							function onNewServiceWorker(registration, callback) {
								if (registration.waiting) {
									// SW is waiting to activate. Can occur if multiple clients open and
									// one of the clients is refreshed.
									return callback();
								}

								function listenInstalledStateChange() {
								registration.installing.addEventListener('statechange', function(event) {
									if (event.target.state === 'installed') {
										// A new service worker is available, inform the user
										callback();
									}
								});
							};

							if (registration.installing) {
								return listenInstalledStateChange();
							}

							// We are currently controlled so a new SW may be found...
							// Add a listener in case a new SW is found,
							registration.addEventListener('updatefound', listenInstalledStateChange);
						}
					`
					}}
				/>

				<script
					charSet='UTF-8'
					dangerouslySetInnerHTML={{
						__html: `window.__APOLLO_STATE__=${JSON.stringify(apolloState)};`
					}}
				/>

				<div
					id='root'
					dangerouslySetInnerHTML={{
						__html: html
					}}
				/>

				{loadableState.getScriptElements()}

				{/* Carga de css 
				<script
					charSet='UTF-8'
					dangerouslySetInnerHTML={{
						__html: ` var loadDeferredStyles = function() {
                        let addStylesNode = document.getElementById("deferred-styles");
                        let replacement = document.createElement("div");
                        replacement.innerHTML = addStylesNode.textContent;
                        document.body.appendChild(replacement)
                        addStylesNode.parentElement.removeChild(addStylesNode);
                      };
                      var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                      if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
                      else window.addEventListener('load', loadDeferredStyles);`
					}}
				/>
          */}
			</body>
		</html>
	)
}

Html.propTypes = {
	html: PropTypes.string,
	head: PropTypes.object,
	jsFiles: PropTypes.object,
	cssFiles: PropTypes.array,
	material: PropTypes.string,
	loadableState: PropTypes.any,
	apolloState: PropTypes.object
}

export default Html
