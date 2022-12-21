#bin/bash
grep -v 'exports.Pose = Pose;' node_modules/@mediapipe/pose/pose.js > tmpfile && mv tmpfile node_modules/@mediapipe/pose/pose.js
grep -v 'exports.POSE_CONNECTIONS = POSE_CONNECTIONS;' node_modules/@mediapipe/pose/pose.js > tmpfile && mv tmpfile node_modules/@mediapipe/pose/pose.js
grep -v 'exports.drawConnectors = drawConnectors;' node_modules/@mediapipe/drawing_utils/drawing_utils.js > tmpfile && mv tmpfile node_modules/@mediapipe/drawing_utils/drawing_utils.js
grep -v 'exports.drawLandmarks = drawLandmarks;' node_modules/@mediapipe/drawing_utils/drawing_utils.js > tmpfile && mv tmpfile node_modules/@mediapipe/drawing_utils/drawing_utils.js
grep -v 'exports.Camera = Camera;' node_modules/@mediapipe/camera_utils/camera_utils.js > tmpfile && mv tmpfile node_modules/@mediapipe/camera_utils/camera_utils.js
grep -v 'exports.SelfieSegmentation = SelfieSegmentation;' node_modules/@mediapipe/selfie_segmenation/selfie_segmenation.js > tmpfile && mv tmpfile node_modules/@mediapipe/selfie_segmenation/selfie_segmenation.js
