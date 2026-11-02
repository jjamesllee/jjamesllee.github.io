---
layout: "project"
project_class: "larpedin"
content_wrapper: false
permalink: "/projects/larpedin/"
title: "LarpedIn: Smart Glasses to LinkedIn"
gallery_title: "LarpedIn"
gallery_summary: "Everyday moments, recast as LinkedIn thought leadership through smart glasses and AI."
summary: "A hands-free hackathon prototype that turns moments captured on Meta glasses into satirical LinkedIn posts, combining video, audio, two AI stages, and publishing integration."
card_summary: "Built at LarpHacks 2026 at U of T’s Bahen Centre. I worked on getting video and audio from Meta glasses into the AI pipeline and helped implement LinkedIn posting logic."
description: "Cheng-Chi Lee’s LarpedIn hackathon project: Meta glasses capture, audio and video routing, AI integration, and LinkedIn publishing."
course: "LarpHacks 2026 · University of Toronto"
category: "personal"
year: 2026
date: "2026-11-01"
recent_order: 0
order: 1
role: "Wearable media integration · LinkedIn API integration"
thumbnail: "/projects/larpedin/images/app-icon.png"
github: "https://github.com/dinud2/LarpedIn"
technologies: ["Swift", "SwiftUI", "Meta Wearables SDK", "AVFoundation", "FFmpeg", "OpenRouter", "LinkedIn API"]
tags: ["programming", "wearable-computing", "multimodal-ai", "api-integration", "hackathon", "prototyping", "teamwork"]
cover: {"image": "/projects/larpedin/images/app-icon.png", "alt": "LarpedIn app icon showing smart glasses, a camera, and an upward trend arrow", "caption": "The team’s app icon. LarpHacks · November 1, 2026 · Bahen Centre, Toronto."}
---

<div class="larpedin-story">
<nav class="larpedin-nav" aria-label="LarpedIn project sections"><a href="#larp-idea">The idea</a><a href="#larp-pipeline">How it works</a><a href="#larp-contribution">My contribution</a><a href="#larp-decisions">Problems we solved</a><a href="#larp-demo">Demo flow</a><a href="#larp-takeaways">What I learned</a><a href="#larp-next">Limits & next steps</a></nav>
<section id="larp-idea"><h2>An ordinary moment. An extraordinary professional persona.</h2>
<p>The LarpHacks theme was to build a product that helps you LARP as someone you are not. Our team chose the over-the-top LinkedIn thought leader: someone who can turn almost anything into a lesson about leadership, growth, or hustle.</p>
<p>LarpedIn captures a short first-person moment through Meta glasses, listens to what was said, and turns it into a deliberately self-important post with a frame from the clip. The joke is in the persona; the engineering challenge is connecting the wearable, phone, AI services, and publishing API.</p>
</section>
<section id="larp-pipeline"><h2>From a moment to a post</h2>
<ol class="larpedin-flow">
<li><h3>Capture</h3><p>Meta glasses stream video and microphone audio to the iOS app.</p></li>
<li><h3>Package</h3><p>A rolling buffer keeps recent footage; the selected clip is exported as an MP4 and uploaded.</p></li>
<li><h3>Interpret</h3><p>FFmpeg extracts frames and audio. One AI stage transcribes speech; another uses the frames and transcript to write the post and select an image.</p></li>
<li><h3>Publish</h3><p>The backend saves a draft and can upload the selected image and publish through LinkedIn when configured.</p></li>
</ol>
<p>The prototype supports short clips from a rolling 30-second buffer. Its backend samples up to 32 frames, runs transcription alongside frame extraction, then sends the combined context to the post-writing model through OpenRouter.</p>
</section>
<section id="larp-contribution"><h2>My contribution</h2>
<div class="larpedin-cards">
<article class="larpedin-card"><h3>Video & audio</h3><p>I worked on bringing video and audio from the Meta glasses into the app and routing both into the AI workflow.</p></article>
<article class="larpedin-card"><h3>Connecting the pipeline</h3><p>My focus was the handoff between the glasses, phone, and AI inputs, so the system could use both what was seen and what was said.</p></article>
<article class="larpedin-card"><h3>LinkedIn publishing</h3><p>I helped implement the posting API and logic that connects generated text and the selected image to LinkedIn.</p></article>
</div>
</section>
<section id="larp-decisions"><h2>Problems we solved</h2>
<div class="larpedin-cards">
<article class="larpedin-card"><h3>Playable clips</h3><p>The glasses stream lacked usable timestamps, and clips could start on a garbled frame. We added timing and began each clip on a complete frame.</p></article>
<article class="larpedin-card"><h3>Audio the AI could use</h3><p>The writing model could read text and images, but not audio. Gemini Flash transcribed the clip before Claude Sonnet received its transcript and frames through OpenRouter.</p></article>
<article class="larpedin-card"><h3>Context within a budget</h3><p>More high-resolution images increased time and cost. We sampled 32 evenly spaced, reduced-size frames and used one model call to write the post and pick its photo.</p></article>
</div>
</section>
<section id="larp-demo"><h2>A short demo with a visible result</h2>
<p>The demo flow is simple: capture an everyday moment, send the clip, inspect the generated post and chosen frame, then show the saved draft or published result. The iOS Live Activity reports processing progress so the wearer does not have to guess whether the clip is still being handled.</p>
<p>This was a team hackathon prototype, built under a short deadline. The repository documents the implementation and setup; using the hardware flow requires compatible glasses, an iPhone, developer permissions, and configured backend services.</p>
</section>
<section id="larp-takeaways"><h2>What I learned</h2>
<p>A video stream is not yet a playable clip. Working through missing timestamps and broken starting frames taught me why timing and complete frames matter. Getting usable video and audio into the pipeline matters as much as asking the models for a good answer. Receiving a clip, generating a draft, and publishing a post need distinct states. Clear feedback makes a chain of services easier to explain and debug.</p>
</section>
<section id="larp-next"><h2>What I would improve next</h2>
<p>The next product steps are to bring draft review into the app, add a tone control from a quiet humblebrag to full keynote-speaker energy, and offer an honest mode for genuine event recaps and field notes.</p>
<p>Before treating this as a public product, I would add authenticated uploads, explicit review before posting, and stronger handling of captured people and conversations. I would also measure end-to-end latency and test disconnects, silent clips, and publishing failures across devices. The experimental glasses features and external API permissions remain practical constraints.</p>
<p><a href="https://github.com/dinud2/LarpedIn" target="_blank" rel="noopener noreferrer">Explore the team repository</a></p></section>
<p><a href="https://claude.ai/artifact/1v2sqPTjiZ562BtDpULTQ5" target="_blank" rel="noopener noreferrer">View the hackathon presentation</a></p></div>
