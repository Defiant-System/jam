
import { EventHandlers } from "./modules/eventHandlers";
import { Audio } from "./modules/audio";

const defjam = {
	init() {
		// fast references
		this.content = window.find("content");
		this.panelLeft = window.find(".panel-left");
		this.sidebar = window.find(".sidebar");
		this.audioChart = window.find(".audio-chart");
		this.panelBottom = window.find(".panel-bottom");
		this.rack = window.find(".box.rack");
		this.rowFoot = window.find(".row-foot");

		EventHandlers.init();
		Audio.init();

		// tag all list items with id's
		window.bluePrint.selectNodes("//Sounds//*")
			.map((node, i) => node.setAttribute("id", 100 + i));

		// temp
		this.dispatch({ type: "render-view" });
	},
	async dispatch(event) {
		let self = defjam,
			path,
			url,
			name,
			value,
			isOn,
			pEl,
			el;
		//console.log(event);
		switch (event.type) {
			case "render-view":
				window.render({
					template: "sidebar-list",
					data: window.bluePrint.selectSingleNode("//Drums"),
					append: self.sidebar.find(".sounds-body .box-body:first")
				});

				window.render({
					template: "session",
					data: window.bluePrint.selectSingleNode("//file"),
					prepend: self.content.find(".session-wrapper")
				});

				// rendering drumkit
				window.render({
					template: "rack-drumkit",
					prepend: self.content.find(".drumkit-body")
				});

				// rendering devices
				window.render({
					template: "device-adsr",
					prepend: self.content.find(".devices-body")
				});

				window.render({
					template: "device-fr",
					prepend: self.content.find(".devices-body")
				});

				// window.render({
				// 	template: "device-sd",
				// 	prepend: self.content.find(".devices-body")
				// });

				// temp
				//setTimeout(() => self.sidebar.find(".item:nth-child(2)").trigger("click"), 2000);
				//await defiant.cache.clear();
				
				//await defiant.cache.clear("/cache/snare.png");
				// await Audio.visualizeFile({
				// 	url: "~/sounds/drumkit/kick.wav",
				// 	width: 480,
				// 	height: 74
				// });
				break;
			case "play-audio":
				self.audioChart
					.cssSequence("play", "transitionend", el => el.removeClass("play"));
				break;
			case "preview-audio":
				el = $(event.target);
				if (event.target === event.el[0]) return;
				if (el.prop("nodeName") === "SPAN") el = el.parents(".folder, .item");
				pEl = el.parents(".box-body");

				if (el.hasClass("item")) {
					pEl.find(".active").removeClass("active");
					el.addClass("active");
					// update audio chart box
					url = "~/sounds/"+ el.data("path");
					path = await Audio.visualizeFile({ url, width: 202, height: 31 });
					self.audioChart
						.css({ "background-image": `url(${path})` })
						.cssSequence("play", "transitionend", el => el.removeClass("play"));
				} else {
					// folder
					if (el.hasClass("open")) {
						el.cssSequence("!open", "transitionend", e => e.find("> div > div").html(""));
					} else {
						// collapse previously open folder
						pEl.find(".open span").trigger("click");
						// render contents of folder
						window.render({
							template: "sidebar-list",
							data: window.bluePrint.selectSingleNode("//data"),
							match: `//*[@id = "${el.data("id")}"]`,
							append: el.find("> div > div")
						});
						// expand folder
						el.addClass("open");
					}
				}
				break;
			case "show-sounds":
			case "show-drums":
			case "show-instruments":
			case "show-fx":
				if (event.el.hasClass("active")) return;
				event.el.parent().find(".active").removeClass("active");
				event.el.addClass("active");

				name = ["from"];
				name.push(self.sidebar.prop("className").split("show-")[1].split(" ")[0]);
				name.push("to");
				name.push(event.type.split("-")[1]);
				name = name.join("-");

				self.sidebar
					.cssSequence(name, "animationend", el =>
						el.parent()
							.removeClass("show-sounds show-drums show-instruments show-fx "+ name)
							.addClass(event.type));
				break;
			case "toggle-work-panel":
				el = event.el;
				isOn = el.hasClass("toggled");
				el.toggleClass("toggled", isOn);
				self.panelLeft.toggleClass("hide", isOn);
				break;
			case "toggle-rack-panel":
				el = event.el;
				isOn = el.hasClass("toggled");
				el.toggleClass("toggled", isOn);
				self.panelBottom.toggleClass("hide", isOn);

				self.rowFoot.find(".box.active").toggleClass("hidden", isOn);
				break;
			case "show-devices-rack":
			case "show-drumkit-rack":
			case "show-midi-rack":
				event.el.parent().find(".box.active").removeClass("active");
				event.el.addClass("active");

				self.rack
					.removeClass("show-devices show-drumkit show-midi")
					.addClass("show-"+ event.type.split("-")[1]);

				// expand rack - if needed
				el = self.rowFoot.find(".ball-button");
				if (el.hasClass("toggled")) {
					el.trigger("click");
				}
				break;
		}
	}
};

window.exports = defjam;
