import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js";
import { vertexShader, fragmentShader } from "./shaders.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------------- LENIS ---------------- */
const lenis = new Lenis({ smoothWheel: true });

function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* ---------------- CONFIG ---------------- */
const CONFIG = {
    color: "#ebf5df",
    spread: 0.6,
    speed: 1.15,
};

/* ---------------- DOM ---------------- */
const hero = document.querySelector(".hero");
const canvas = document.querySelector("#hero-canvas");

/* ---------------- THREE ---------------- */
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
});

/* ---------------- HELPERS ---------------- */
function hexToRgb(hex) {
    const c = hex.replace("#", "");
    return {
        r: parseInt(c.substring(0, 2), 16) / 255,
        g: parseInt(c.substring(2, 4), 16) / 255,
        b: parseInt(c.substring(4, 6), 16) / 255,
    };
}

/* ---------------- RESIZE ---------------- */
function resize() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    material.uniforms.uResolution.value.set(w, h);
}

window.addEventListener("resize", resize);

/* ---------------- MATERIAL ---------------- */
const rgb = hexToRgb(CONFIG.color);

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread: { value: CONFIG.spread },
    },
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

resize();

/* ---------------- RENDER LOOP ---------------- */
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

/* ---------------- SCROLL → SHADER ---------------- */
lenis.on("scroll", ({ scroll }) => {
    const heroTop = hero.offsetTop;
    const heroHeight = hero.offsetHeight;
    const viewport = window.innerHeight;

    const localScroll = scroll - heroTop;
    const maxScroll = heroHeight - viewport;

    const progress = THREE.MathUtils.clamp(localScroll / maxScroll, 0, 1);
    material.uniforms.uProgress.value = progress * CONFIG.speed;
});

/* ---------------- TEXT REVEAL ---------------- */
const heroH2 = document.querySelector(".hero-content h2");
const split = new SplitText(heroH2, { type: "words" });
const words = split.words;

gsap.set(words, { opacity: 0 });

ScrollTrigger.create({
    trigger: ".hero-content",
    start: "top 70%",
    end: "bottom top",
    scrub: true,
    onUpdate(self) {
        const p = self.progress;

        words.forEach((word, i) => {
            const wStart = i / words.length;
            const wEnd = (i + 1) / words.length;

            word.style.opacity = THREE.MathUtils.clamp((p - wStart) / (wEnd - wStart), 0, 1);
        });
    },
});
