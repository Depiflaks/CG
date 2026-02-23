//
// Created by smmm on 2/16/26.
//

#ifndef CG_FONT_H
#define CG_FONT_H
#include <SFML/Graphics/Font.hpp>
#include <iostream>

namespace sfml_core
{

constexpr auto k_fontPath{ "assets/DejaVuSans.ttf" };

inline sf::Font loadFont()
{
	sf::Font font;
	if (!font.loadFromFile(k_fontPath))
	{
		throw std::runtime_error("Failed to load font from: " + std::string(k_fontPath));
	}
	return font;
}

} // namespace core

#endif // CG_FONT_H
