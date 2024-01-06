import torch
import torchvision.transforms as transforms

from server.model import ResNetModel

def main():
    pytorch_model = ResNetModel()
    pytorch_model.load_state_dict(torch.load('model.pt', map_location=torch.device('cpu')))
    pytorch_model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(pytorch_model, dummy_input, 'onnx_model.onnx', verbose=True, export_params=True)

if __name__ == '__main__':
    main()
