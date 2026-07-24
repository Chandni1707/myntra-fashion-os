import cv2
import os
import uuid

FRAME_DIR = "uploads/frames"
os.makedirs(FRAME_DIR, exist_ok=True)


def extract_frames(video_path, num_frames=5):
    cap = cv2.VideoCapture(video_path)

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        raise Exception("Could not read video.")

    frame_numbers = [
        int(i * total_frames / (num_frames + 1))
        for i in range(1, num_frames + 1)
    ]

    saved_frames = []

    for frame_no in frame_numbers:

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)

        success, frame = cap.read()

        if success:

            filename = os.path.join(
                FRAME_DIR,
                f"{uuid.uuid4().hex}.jpg",
            )

            cv2.imwrite(filename, frame)

            saved_frames.append(filename)

    cap.release()

    return saved_frames