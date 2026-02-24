//
// Created by smmm on 2/24/26.
//

#ifndef CG_HANGMAN_H
#define CG_HANGMAN_H

#include <SFML/Graphics.hpp>

namespace hangman
{

struct HangmanConfig
{
	sf::Color gallowsColor{ sf::Color::Black };
	sf::Color manColor{ sf::Color::Black };
	float lineWidth{ 4.f };

	sf::Vector2f basePosition{ 50.f, 400.f };

	float baseWidth{ 200.f };
	float poleHeight{ 300.f };
	float topWidth{ 150.f };
	float ropeLength{ 50.f };

	float headRadius{ 25.f };
	float bodyLength{ 80.f };
	float limbLength{ 60.f };
};

void DrawHangman(sf::RenderTarget& target,
	int attempts,
	const HangmanConfig& config = HangmanConfig());

} // namespace hangman

#endif // CG_HANGMAN_H
