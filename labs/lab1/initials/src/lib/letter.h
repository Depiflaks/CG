#ifndef CG_LETTER_H
#define CG_LETTER_H
#include "core/core.h"

#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Graphics/ConvexShape.hpp>
#include <SFML/Graphics/RectangleShape.hpp>
#include <cmath>

class Letter : public core::Kinematic
{
public:
	Letter(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration, const sf::Vector2f& bounds)
		: Kinematic(position, speed, acceleration)
		, m_bounds(bounds)
	{
	}

	[[nodiscard]] sf::Vector2f GetBounds() const
	{
		return m_bounds;
	}

	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states) = 0;

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
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states)
	{
		states.transform.translate(Position());
		target.draw(m_outer, states);
		target.draw(m_cut, states);
		target.draw(m_inner, states);
	}

private:
	void Build()
	{
		const float w = GetBounds().x;
		const float h = GetBounds().y;

		const float t = std::max(2.f, std::min(w, h) * 0.22f);

		const float rxO = w * 0.5f;
		const float ryO = h * 0.5f;

		const float rxI = std::max(0.f, rxO - t);
		const float ryI = std::max(0.f, ryO - t);

		const float cutW = std::max(1.f, rxO * 1.1f);
		const float cutH = std::max(1.f, h * 0.60f);

		m_outer = MakeEllipse(rxO, ryO, m_color, 96);

		m_inner = MakeEllipse(rxI, ryI, sf::Color(255, 255, 255, 255), 96);

		m_cut.setSize({ cutW, cutH });
		m_cut.setFillColor(sf::Color(255, 255, 255, 255));
		m_cut.setOrigin(cutW * 0.5f, cutH * 0.5f);
		m_cut.setPosition(rxO * 0.45f, 0.f);

		m_outer.setOrigin(rxO, ryO);
		m_inner.setOrigin(rxI, ryI);
		m_outer.setPosition(0.f, 0.f);
		m_inner.setPosition(0.f, 0.f);
	}

	static sf::ConvexShape MakeEllipse(
		float rx, float ry, sf::Color c, int segments)
	{
		sf::ConvexShape s;
		s.setPointCount(static_cast<std::size_t>(std::max(3, segments)));
		for (int i = 0; i < segments; ++i)
		{
			const float a
				= (static_cast<float>(i) / static_cast<float>(segments))
				* 6.28318530718f;
			s.setPoint(static_cast<std::size_t>(i),
				{ rx + std::cos(a) * rx, ry + std::sin(a) * ry });
		}
		s.setFillColor(c);
		return s;
	}

	sf::Color m_color;

	sf::ConvexShape m_outer;
	sf::ConvexShape m_inner;
	sf::RectangleShape m_cut;
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

	void Draw(sf::RenderTarget& target, sf::RenderStates states)
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
