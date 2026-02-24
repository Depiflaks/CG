#include "hangman.h"
#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Graphics/RectangleShape.hpp>
#include <cmath>

namespace hangman
{

static sf::RectangleShape createLine(const sf::Vector2f& start,
	const sf::Vector2f& end,
	float thickness,
	sf::Color color)
{
	const float length = std::sqrt(
		std::pow(end.x - start.x, 2) + std::pow(end.y - start.y, 2));
	const float angle
		= std::atan2(end.y - start.y, end.x - start.x) * 180.f / 3.14159265f;

	sf::RectangleShape line({ length, thickness });
	line.setFillColor(color);
	line.setPosition(start);
	line.setOrigin(0.f, thickness / 2.f);
	line.setRotation(angle);

	return line;
}

static sf::CircleShape createCircle(
	const sf::Vector2f& center, float radius, sf::Color color)
{
	sf::CircleShape circle(radius);
	circle.setFillColor(sf::Color::Transparent);
	circle.setOutlineColor(color);
	circle.setOutlineThickness(4.f);
	circle.setPosition(center.x - radius, center.y - radius);
	return circle;
}

void DrawHangman(
	sf::RenderTarget& target, int attempts, const HangmanConfig& config)
{
	const sf::Vector2f base = config.basePosition;

	{
		sf::RectangleShape baseRect({ config.baseWidth, config.lineWidth });
		baseRect.setFillColor(config.gallowsColor);
		baseRect.setPosition(base);
		target.draw(baseRect);
	}

	{
		sf::Vector2f poleStart = { base.x + config.baseWidth / 2.f, base.y };
		sf::Vector2f poleEnd = { poleStart.x, poleStart.y - config.poleHeight };
		target.draw(createLine(
			poleStart, poleEnd, config.lineWidth, config.gallowsColor));

		sf::Vector2f topStart = poleEnd;
		sf::Vector2f topEnd = { topStart.x + config.topWidth, topStart.y };
		target.draw(createLine(
			topStart, topEnd, config.lineWidth, config.gallowsColor));

		sf::Vector2f ropeStart = topEnd;
		sf::Vector2f ropeEnd = { ropeStart.x, ropeStart.y + config.ropeLength };
		target.draw(createLine(
			ropeStart, ropeEnd, config.lineWidth, config.gallowsColor));
	}

	const sf::Vector2f neckPos
		= { base.x + config.baseWidth / 2.f + config.topWidth,
			  base.y - config.poleHeight + config.ropeLength };
	const float halfLimb = config.limbLength / 2.f;

	const float bodyCenterX = neckPos.x;
	const float bodyTopY = neckPos.y + config.headRadius * 2.f;
	const float bodyBottomY = bodyTopY + config.bodyLength;

	if (attempts <= 6)
	{
		sf::Vector2f headCenter = { neckPos.x, neckPos.y + config.headRadius };
		target.draw(
			createCircle(headCenter, config.headRadius, config.manColor));
	}

	if (attempts <= 5)
	{
		target.draw(createLine({ bodyCenterX, bodyTopY },
			{ bodyCenterX, bodyBottomY },
			config.lineWidth,
			config.manColor));
	}

	if (attempts <= 4)
	{
		target.draw(createLine({ bodyCenterX, bodyBottomY },
			{ bodyCenterX - halfLimb, bodyBottomY + config.limbLength },
			config.lineWidth,
			config.manColor));
	}

	if (attempts <= 3)
	{
		target.draw(createLine({ bodyCenterX, bodyBottomY },
			{ bodyCenterX + halfLimb, bodyBottomY + config.limbLength },
			config.lineWidth,
			config.manColor));
	}

	if (attempts <= 2)
	{
		const float armStartY = bodyTopY + config.bodyLength * 0.3f;
		target.draw(createLine({ bodyCenterX, armStartY },
			{ bodyCenterX - config.limbLength, armStartY + halfLimb },
			config.lineWidth,
			config.manColor));
	}

	if (attempts <= 1)
	{
		const float armStartY = bodyTopY + config.bodyLength * 0.3f;
		target.draw(createLine({ bodyCenterX, armStartY },
			{ bodyCenterX + config.limbLength, armStartY + halfLimb },
			config.lineWidth,
			config.manColor));
	}
}

} // namespace hangman