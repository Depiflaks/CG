//
// Created by smmm on 2/16/26.
//

#ifndef CG_FONT_H
#define CG_FONT_H
#include <SFML/Graphics/Font.hpp>
#include <iostream>

namespace core
{

constexpr auto k_fontPath{ "assets/DejaVuSans.ttf" };

inline sf::Font loadFont()
{
	sf::Font font;
	if (!font.loadFromFile(k_fontPath))
	{
		std::cerr << "Failed to load font\n";
	}
	return font;
}

} // namespace core

#endif // CG_FONT_H
