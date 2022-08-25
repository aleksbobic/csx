from palettable.matplotlib import Plasma_10
from palettable.tableau import Tableau_20, Tableau_10


def generate_rainbow_scale(values):
    color_list_20 = Tableau_20.hex_colors
    color_list_10 = Tableau_10.hex_colors

    if len(values) <= 10:
        return {val: color_list_10[i % 10] for i, val in enumerate(values)}

    return {val: color_list_20[i % 20] for i, val in enumerate(values)}


def generate_cold_hot_scale(min, max):

    color_list_10 = Plasma_10.hex_colors
    step_size = (max - min) / 10
    steps = [min + i * step_size for i in range(0, 11)]
    range_colors = []

    for i, step in enumerate(steps):
        if i == 0:
            continue

        range_colors.append(
            {"min": steps[i - 1], "max": step, "color": color_list_10[(i - 1) % 10]}
        )

    return range_colors
