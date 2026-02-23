//
// Created by smmm on 2/23/26.
//

#ifndef CG_BUTTON_H
#define CG_BUTTON_H

#include "callback.h"
#include "font.h"
#include "sfml_core.h"
#include "view.h"

#include <SFML/Graphics/Font.hpp>
#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Text.hpp>

namespace sfml_core
{

class Button : public Widget
{
public:
	using Locatable::SetPosition;

	explicit Button(SimpleCallback onClick)
		: Widget({}, {})
		, m_onClick(std::move(onClick))
	{
		Build();
	}

	void OnClick() const
	{
		m_onClick();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) const
	{
		target.draw(m_backgroundRect, states);
		target.draw(m_textBlock, states);
	}

	const std::string& Label() const
	{
		return m_label;
	}

	sf::Color LabelColor() const
	{
		return m_labelColor;
	}

	uint CharSize() const
	{
		return m_charSize;
	}

	const sf::Font& Font() const
	{
		return m_font;
	}

	const sf::RectangleShape& Background() const
	{
		return m_backgroundRect;
	}

	sf::Vector2f Padding() const
	{
		return { m_paddingX, m_paddingY };
	}

	void SetLabel(const std::string& label)
	{
		m_label = label;
		m_textBlock.setString(label);
	}

	void SetLabelColor(sf::Color color)
	{
		m_labelColor = color;
		m_textBlock.setFillColor(color);
	}

	void SetCharSize(uint charSize)
	{
		m_charSize = charSize;
		m_textBlock.setCharacterSize(charSize);
	}

	void SetPadding(float x, float y)
	{
		m_paddingX = x;
		m_paddingY = y;
	}

	void Rebuild()
	{
		const sf::FloatRect tb = m_textBlock.getLocalBounds();
		SetBounds(
			{ tb.width + 2.f * m_paddingX, tb.height + 2.f * m_paddingY });

		m_backgroundRect.setSize({ Bounds().x, Bounds().y });
		m_textBlock.setOrigin(tb.left, tb.top);

		const sf::Vector2f pos = Position();
		m_textBlock.setPosition(pos.x + m_paddingX, pos.y + m_paddingY);
	}

private:
	using Widget::SetBounds;

	void Build()
	{
		m_font = loadFont();
		m_textBlock.setFont(m_font);
		m_textBlock.setString(m_label);
		m_textBlock.setCharacterSize(m_charSize);
		m_textBlock.setFillColor(m_labelColor);

		m_backgroundRect.setOutlineColor(sf::Color::Black);
		m_backgroundRect.setOutlineThickness(1.f);

		Rebuild();
	}

	float m_paddingX = 5.f;
	float m_paddingY = 5.f;

	SimpleCallback m_onClick;
	sf::RectangleShape m_backgroundRect{};

	sf::Text m_textBlock{};
	sf::Font m_font{};

	std::string m_label{};
	sf::Color m_labelColor = sf::Color::Black;
	uint m_charSize = 16;
};

} // namespace sfml_core

#endif // CG_BUTTON_H
