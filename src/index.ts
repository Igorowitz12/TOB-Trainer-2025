"use strict";

import { Settings, Region, World, Viewport, MapController, TileMarker, Assets, Location, Chrome, ImageLoader, Trainer, ControlPanelController } from "@supalosa/oldschool-trainer-sdk";

import { VerzikRegion as VerzikRegion } from "./content/inferno/js/VerzikRegion";

const SpecialAttackBarBackground = Assets.getAssetUrl("/assets/images/attackstyles/interface/special_attack_background.png");

Settings.readFromStorage();

// Choose the region based on the URL.
const AVAILABLE_REGIONS = {
  'verzik.html': new VerzikRegion(),
};
const DEFAULT_REGION_PATH = 'verzik.html';

const regionName = window.location.pathname.split('/').pop();
const selectedRegion: Region = (regionName in AVAILABLE_REGIONS) ? AVAILABLE_REGIONS[regionName] : AVAILABLE_REGIONS[DEFAULT_REGION_PATH];

// Create world
const world = new World();
world.getReadyTimer = 6;
selectedRegion.world = world;
world.addRegion(selectedRegion);

// Initialise UI
document.getElementById('sidebar_content').innerHTML = selectedRegion.getSidebarContent();

document.getElementById("reset").addEventListener("click", () => {
    Trainer.reset();
});

document.getElementById("settings").addEventListener("click", () => {
    ControlPanelController.controller.setActiveControl('SETTINGS');
});


const { player } = selectedRegion.initialiseRegion();

Viewport.setupViewport(selectedRegion);
Viewport.viewport.setPlayer(player);
ControlPanelController.controller.setActiveControl('INVENTORY');


ImageLoader.onAllImagesLoaded(() => {
  MapController.controller.updateOrbsMask(player.currentStats, player.stats);
});


TileMarker.loadAll(selectedRegion);

player.perceivedLocation = player.location;
player.destinationLocation = player.location;
/// /////////////////////////////////////////////////////////
// UI controls

ImageLoader.onAllImagesLoaded(() =>
  MapController.controller.updateOrbsMask(Trainer.player.currentStats, Trainer.player.stats),
);

ImageLoader.onAllImagesLoaded(() => {
  drawAssetLoadingBar(loadingAssetProgress);
  imagesReady = true;
  checkStart();
});

const interval = setInterval(() => {
  ImageLoader.checkImagesLoaded(interval);
}, 50);

Assets.onAllAssetsLoaded(() => {
  const originalDraw = MapController.controller.draw.bind(MapController.controller);

  MapController.controller.draw = (ctx: CanvasRenderingContext2D) => {
    //console.log("✅ Custom minimap draw() is running.");
    originalDraw(ctx);
  };

  Viewport.viewport.initialise().then(() => {
    console.log("assets are preloaded");
    assetsPreloaded = true;
    checkStart();
  });
});

function drawAssetLoadingBar(loadingProgress: number) {
  const specialAttackBarBackground = ImageLoader.createImage(SpecialAttackBarBackground);
  const { width: canvasWidth, height: canvasHeight } = Chrome.size();
  const canvas = document.getElementById("world") as HTMLCanvasElement;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#FFFF00";
  context.font = "32px OSRS";
  context.textAlign = "center";
  context.fillText(`Loading models: ${Math.floor(loadingProgress * 100)}%`, canvas.width / 2, canvas.height / 2);
  const scale = 3;
  const left = canvasWidth / 2 - (specialAttackBarBackground.width * scale) / 2;
  const top = canvasHeight / 2 + 20;
  const width = specialAttackBarBackground.width * scale;
  const height = specialAttackBarBackground.height * scale;
  context.drawImage(specialAttackBarBackground, left, top, width, height);
  context.fillStyle = "#730606";
  context.fillRect(left + 2 * scale, top + 6 * scale, width - 4 * scale, height - 12 * scale);
  context.fillStyle = "#397d3b";
  context.fillRect(left + 2 * scale, top + 6 * scale, (width - 4 * scale) * loadingProgress, height - 12 * scale);
  context.fillStyle = "#000000";
  context.globalAlpha = 0.5;
  context.strokeRect(left + 2 * scale, top + 6 * scale, width - 4 * scale, height - 12 * scale);
  context.globalAlpha = 1;
}

let loadingAssetProgress = 0.0;
drawAssetLoadingBar(loadingAssetProgress);

Assets.onAssetProgress((loaded, total) => {
  loadingAssetProgress = loaded / total;
  drawAssetLoadingBar(loadingAssetProgress);
});

const assets2 = setInterval(() => {
  Assets.checkAssetsLoaded(assets2);
}, 50);

let imagesReady = false;
let assetsPreloaded = false;
let started = false;

function checkStart() {
  if (!started && imagesReady && assetsPreloaded) {
    started = true;

    // Start the engine
    world.startTicking();

    // 🔵 Start drawing minimap dot every 100ms
    setInterval(() => {
      console.log("drawing dot"); // ✅ stays in for debug
      drawPlayerMinimapDot();
    }, 100);
  }
}

function drawPlayerMinimapDot() {
  const canvas = document.getElementById("minimapDots") as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const player = Trainer.player;
  if (!player) return;

  const minimapCenterX = 124 / 2;
  const minimapCenterY = 124/ 2;

  const baseX = 25; // center of room
  const baseY = 26;

  const scale = 2.5; // tile to pixel scale

  const clampedX = Math.max(0, Math.min(player.location.x, 50));
const clampedY = Math.max(0, Math.min(player.location.y, 56));

const offsetX = (clampedX - baseX) * scale;
const offsetY = (clampedY - baseY) * scale;


  let dotX = minimapCenterX + offsetX;
  let dotY = minimapCenterY + offsetY;

  // ✅ Clamp dot to canvas bounds
  const margin = 6; // dot radius
  dotX = Math.max(margin, Math.min(canvas.width - margin, dotX));
  dotY = Math.max(margin, Math.min(canvas.height - margin, dotY));

  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
}


/// /////////////////////////////////////////////////////////


// UI disclaimer
const topHeaderContainer = document.getElementById("disclaimer_panel");
topHeaderContainer.innerHTML =
  'Work in progress.<br />' +
  topHeaderContainer.innerHTML;
