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
	Button(const sf::Vector2f& position,
		const sf::Vector2f& size,
		SimpleCallback onClick,
		const std::string& label,
		sf::Color labelColor,
		uint charSize)
		: Widget(position, size)
		, m_onClick(std::move(onClick))
	{
		Build(label, labelColor, charSize);
	}

	Button(SimpleCallback onClick,
		const std::string& label,
		sf::Color labelColor,
		uint charSize)
		: Widget({}, {})
		, m_onClick(std::move(onClick))
	{
		Build(label, labelColor, charSize);
	}

	void OnClick() const
	{
		m_onClick();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) const
	{
		target.draw(m_background, states);
		target.draw(m_text, states);
	}

	const std::string& GetLabel() const
	{
		return m_label;
	}

	sf::Color GetLabelColor() const
	{
		return m_labelColor;
	}

	uint GetCharSize() const
	{
		return m_charSize;
	}

	const sf::Font& GetFont() const
	{
		return m_font;
	}

	const sf::RectangleShape& GetBackground() const
	{
		return m_background;
	}

	sf::Vector2f GetPadding() const
	{
		return { m_paddingX, m_paddingY };
	}

	void SetLabel(const std::string& label)
	{
		m_label = label;
		m_text.setString(label);
		UpdateSize();
	}

	void SetLabelColor(sf::Color color)
	{
		m_labelColor = color;
		m_text.setFillColor(color);
	}

	void SetCharSize(uint charSize)
	{
		m_charSize = charSize;
		m_text.setCharacterSize(charSize);
		UpdateSize();
	}

	void SetFont(const sf::Font& font)
	{
		m_font = font;
		m_text.setFont(font);
		UpdateSize();
	}

	void SetPadding(float x, float y)
	{
		m_paddingX = x;
		m_paddingY = y;
	}

private:
	void Build(const std::string& label, sf::Color labelColor, uint charSize)
	{
		m_font = loadFont();
		m_text.setFont(m_font);
		m_text.setString(label);
		m_text.setCharacterSize(charSize);
		m_text.setFillColor(labelColor);

		const sf::FloatRect tb = m_text.getLocalBounds();
		SetBounds(
			{ tb.width + 2.f * m_paddingX, tb.height + 2.f * m_paddingY });

		m_background.setSize({ Bounds().x, Bounds().y });
		m_background.setOutlineColor(sf::Color::Black);
		m_background.setOutlineThickness(1.f);

		m_text.setOrigin(tb.left, tb.top);
	}

	void UpdateSize()
	{
		const sf::FloatRect tb = m_text.getLocalBounds();
		SetBounds(
			{ tb.width + 2.f * m_paddingX, tb.height + 2.f * m_paddingY });

		m_background.setSize({ Bounds().x, Bounds().y });
		m_text.setOrigin(tb.left, tb.top);

		const sf::Vector2f pos = GetPosition();
		m_text.setPosition(pos.x + m_paddingX, pos.y + m_paddingY);
	}

	float m_paddingX = 5.f;
	float m_paddingY = 5.f;

	SimpleCallback m_onClick;
	sf::RectangleShape m_background{};

	sf::Text m_text{};
	sf::Font m_font{};

	std::string m_label{};
	sf::Color m_labelColor = sf::Color::Black;
	uint m_charSize = 16;
};

} // namespace sfml_core

#endif // CG_BUTTON_H
