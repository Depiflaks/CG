#ifndef CG_LETTER_H
#define CG_LETTER_H
#include "core/core.h"

#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Graphics/RectangleShape.hpp>

class Letter
	: public core::Drawable
	, public core::Kinematic
{
public:
	Letter(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration, const sf::Vector2f& bounds)
		: Kinematic(position, speed, acceleration)
		, m_bounds(bounds)
	{
	}

	sf::Vector2f GetBounds() const
	{
		return m_bounds;
	}

private:
	sf::Vector2f m_bounds;
};

class LetterS final : public Letter
{
public:
	LetterS(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration, const sf::Vector2f& bounds,
		const sf::Color& color)
		: Letter(position, speed, acceleration, bounds)
		, m_color(color)
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		const auto pos = Position();
		const float w = GetBounds().x;
		const float h = GetBounds().y;
		const float t = std::max(2.f, std::min(w, h) * 0.22f);

		const sf::Vector2f tl{ pos.x - w * 0.5f, pos.y - h * 0.5f };

		sf::RectangleShape top({ w, t });
		top.setPosition(tl);
		top.setFillColor(m_color);

		sf::RectangleShape left({ t, h });
		left.setPosition(tl);
		left.setFillColor(m_color);

		sf::RectangleShape bottom({ w, t });
		bottom.setPosition({ tl.x, tl.y + h - t });
		bottom.setFillColor(m_color);

		target.draw(top, states);
		target.draw(left, states);
		target.draw(bottom, states);
	}

private:
	sf::Color m_color;
};

class LetterU final : public Letter
{
public:
	LetterU(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration, const sf::Vector2f& bounds,
		const sf::Color& color)
		: Letter(position, speed, acceleration, bounds)
		, m_color(color)
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		const auto pos = Position();
		const float w = GetBounds().x;
		const float h = GetBounds().y;
		const float t = std::max(2.f, std::min(w, h) * 0.18f);

		const sf::Vector2f tl{ pos.x - w * 0.5f, pos.y - h * 0.5f };

		sf::RectangleShape leftBar({ t, h });
		leftBar.setPosition(tl);
		leftBar.setFillColor(m_color);

		const float rOuter = h * 0.5f;
		const float rInner = std::max(0.f, rOuter - t);
		const sf::Vector2f cCenter{ tl.x + t + rOuter, tl.y + rOuter };

		sf::CircleShape outer(rOuter);
		outer.setFillColor(m_color);
		outer.setOrigin(rOuter, rOuter);
		outer.setPosition(cCenter);

		sf::CircleShape inner(rInner);
		inner.setFillColor(sf::Color::White);
		inner.setOrigin(rInner, rInner);
		inner.setPosition(cCenter);

		target.draw(leftBar, states);
		target.draw(outer, states);
		target.draw(inner, states);
	}

private:
	sf::Color m_color;
};

#endif // CG_LETTER_H
