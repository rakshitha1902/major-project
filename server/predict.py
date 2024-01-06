import sys
import json
import onnxruntime as ort
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

model_path = "onnx_model.onnx"
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
    img = Image.open(image_path)
    x = transform(img)
    x = x.unsqueeze(0)  # add batch dimension

    outputs = ort_sess.run(None, {'input.1': x.numpy()})
    
    sorted_predictions = np.argsort(outputs)[0][0][::-1]
    predictions = [{"category": categories[prediction], "value": float(outputs[0][0][prediction])} for prediction in sorted_predictions]

    return json.dumps(predictions)

if __name__ == "__main__":
    image_path = sys.argv[1]
    predictions = predict(image_path)
    print(predictions)
