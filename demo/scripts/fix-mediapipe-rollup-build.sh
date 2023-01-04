#bin/bash
# See https://github.com/google/mediapipe/issues/2883
grep -qxF 'exports.Pose = Pose;' node_modules/@mediapipe/pose/pose.js || echo 'exports.Pose = Pose;' >> node_modules/@mediapipe/pose/pose.js
grep -qxF 'exports.POSE_CONNECTIONS = POSE_CONNECTIONS;' node_modules/@mediapipe/pose/pose.js || echo 'exports.POSE_CONNECTIONS = POSE_CONNECTIONS;' >> node_modules/@mediapipe/pose/pose.js
grep -qxF 'exports.Camera = Camera;' node_modules/@mediapipe/camera_utils/camera_utils.js || echo 'exports.Camera = Camera;' >> node_modules/@mediapipe/camera_utils/camera_utils.js
grep -qxF 'exports.SelfieSegmentation = SelfieSegmentation;' node_modules/@mediapipe/selfie_segmentation/selfie_segmentation.js || echo 'exports.SelfieSegmentation = SelfieSegmentation;' >> node_modules/@mediapipe/selfie_segmentation/selfie_segmentation.js
