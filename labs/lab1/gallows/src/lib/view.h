//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "model.h"

#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <memory>
#include <random>

#include <algorithm>
#include <cctype>
#include <functional>
#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace view
{
static inline bool ContainsPoint(const sf::Vector2f& rectPos,
	const sf::Vector2f& rectSize, const sf::Vector2f& p)
{
	return p.x >= rectPos.x && p.x <= rectPos.x + rectSize.x && p.y >= rectPos.y
		&& p.y <= rectPos.y + rectSize.y;
}

static inline std::u32string CyrillicAlphabet()
{
	return U"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
}

static inline sf::String ToSfString(const std::u32string& s)
{
	return sf::String::fromUtf32(s.begin(), s.end());
}
static inline sf::String ToSfString(const std::string& s)
{
	return sf::String(s);
}

class ViewManager;

class Button
	: public core::Drawable
	, public core::Locatable
	, public core::Draggable
{
public:
	using Callback = std::function<void()>;

	Button(
		const sf::Vector2f& pos, const sf::Vector2f& bounds, Callback onClick)
		: Locatable(pos)
		, m_bounds(bounds)
		, m_onClick(std::move(onClick))
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		sf::RectangleShape r(m_bounds);
		r.setPosition(Position());
		r.setFillColor(m_fill);
		r.setOutlineThickness(m_outlineThickness);
		r.setOutlineColor(m_outline);
		target.draw(r, states);
	}

	void OnMouseDown(sf::Vector2f mousePosition) override
	{
		if (ContainsPoint(Position(), m_bounds, mousePosition))
		{
			if (m_onClick)
				m_onClick();
		}
	}

	void OnMouseUp(sf::Vector2f) override
	{
	}
	void OnMouseMove(sf::Vector2f) override
	{
	}

	void SetColors(
		sf::Color fill, sf::Color outline, float outlineThickness = 2.f)
	{
		m_fill = fill;
		m_outline = outline;
		m_outlineThickness = outlineThickness;
	}

	sf::Vector2f Bounds() const
	{
		return m_bounds;
	}

private:
	sf::Vector2f m_bounds{};
	Callback m_onClick{};
	sf::Color m_fill{ 30, 30, 30 };
	sf::Color m_outline{ 220, 220, 220 };
	float m_outlineThickness{ 2.f };
};

class TextButton final : public Button
{
public:
	TextButton(const sf::Vector2f& pos, const sf::Vector2f& bounds,
		Callback onClick, sf::Font& font, sf::String label, unsigned size = 20u)
		: Button(pos, bounds, std::move(onClick))
		, m_text(label, font, size)
	{
		m_text.setFillColor(sf::Color::White);
		Recenter();
	}

	void SetLabel(sf::String label)
	{
		m_text.setString(label);
		Recenter();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		Button::Draw(target, states);
		target.draw(m_text, states);
	}

private:
	void Recenter()
	{
		auto b = m_text.getLocalBounds();
		m_text.setOrigin(b.left + b.width * 0.5f, b.top + b.height * 0.5f);
		const auto p = Position();
		const auto s = Bounds();
		m_text.setPosition({ p.x + s.x * 0.5f, p.y + s.y * 0.5f });
	}

	sf::Text m_text;
};

class RotateButton final : public TextButton
{
public:
	RotateButton(const sf::Vector2f& pos, const sf::Vector2f& bounds,
		Callback onClick, sf::Font& font)
		: TextButton(
			  pos, bounds, std::move(onClick), font, sf::String("Rotate"), 18u)
	{
		SetColors(sf::Color(40, 40, 40), sf::Color(200, 200, 200), 2.f);
	}
};
} // namespace view
#endif // CG_VIEW_H
