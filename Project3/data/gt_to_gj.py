import rasterio

import matplotlib.pyplot as plt

import numpy as np


ds = rasterio.open("RenderData.tiff")


# Get the data back, weird indexing on first dimension

z = ds.read()[0, :, :]

# Replace the values used to indicate out of bounds

# with something more managable

z[z < -1e9] = -1


# plot

plt.contourf(z)

plt.colorbar()

plt.show()


# Get this size of the dataset

Ny, Nx = z.shape


# This is the transform - it should give

# the corner and the step size in x and y directions

t = ds.get_transform()


# Code to write the .json text file

out_string = '{\n"width": ' + str(Nx) + ',\n"height": ' + str(Ny) + ",\n"

out_string += '"translate": [' + str(t[0]) + "," + str(t[3]) + "],\n"

out_string += '"scale": [' + str(t[1]) + "," + str(t[5]) + "],\n"


out_string += '"values": ['

for row in z:

    for v in row:

        out_string += str(v) + ", "

out_string = out_string[0:-2]

out_string += "]\n}"


print(out_string)
