import numpy as np
from PIL import Image
import math
from io import BytesIO
import sys
from hexbytes import HexBytes


def get_RGB_image(bytecode):
    image = np.frombuffer(bytecode, dtype=np.uint8)
    length = int(math.ceil(len(image)/3))
    image = np.pad(image, pad_width=(0, length*3 - len(image)))
    image = image.reshape((-1, 3))
    sqrt_len = int(math.ceil(math.sqrt(image.shape[0])))
    image = np.pad(image,  pad_width=((0, sqrt_len**2 - image.shape[0]),(0,0)))
    image = image.reshape((sqrt_len, sqrt_len, 3))

    # Use BytesIO to create a binary stream of image data
    image_bytes_io = BytesIO()
    Image.fromarray(image).save(image_bytes_io, format='PNG')
    
    return image_bytes_io.getvalue()  # Return the bytes value

def generate_image(bytecode):
    code = HexBytes(bytecode)
    image = get_RGB_image(code)
    return image

if __name__ == "__main__":
    # Read bytecode from file as string
    bytecode_file = sys.argv[1]
    with open(bytecode_file, 'r') as file:
        bytecode_str = file.read()

    # Convert the string to bytes
    bytecode = bytecode_str.encode('utf-8')

    # Generate RGB image
    rgb_image_data = generate_image(bytecode)

    # Print the binary image data
    sys.stdout.buffer.write(rgb_image_data)
