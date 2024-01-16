import sys
import json
import onnxruntime as ort
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "onnx_model.onnx")
ort_sess = ort.InferenceSession(model_path)

categories = ['access-control', 'arithmetic', 'other', 'reentrancy', 'unchecked-calls']

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def predict(image_path):
    try:
        img = Image.open(image_path)
        x = transform(img)
        x = x.unsqueeze(0)  # add batch dimension

        outputs = ort_sess.run(None, {'input.1': x.numpy()})
        
        # Assuming outputs is a binary array indicating the presence or absence of each vulnerability
        predictions = [{"category": categories[i], "value": int(outputs[0][0][i] >= 0.5)} for i in range(len(categories))]

        return json.dumps(predictions)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    predictions = predict(image_path)
    print(predictions)
