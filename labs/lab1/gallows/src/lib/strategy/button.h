//
// Created by smmm on 2/15/26.
//

#ifndef CG_BUTTON_H
#define CG_BUTTON_H
#include "sfml_core/core.h"
#include "sfml_core/font.h"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Text.hpp>
#include <algorithm>
#include <functional>

class Button : public core::Widget
{
public:
	Button(const sf::Vector2f& position, const sf::Vector2f& size,
		const std::function<void()>& onClick, const std::string& label,
		sf::Color labelColor, uint charSize)
		: Widget(position, size)
		, m_onClick(onClick)
	{
		Build(label, labelColor, charSize);
	}

	void OnClick() const
	{
		m_onClick();
	}

private:
	void Build(const std::string& label, sf::Color labelColor, uint charSize)
	{
		m_text.setFont(core::loadFont());
		m_text.setString(label);
		m_text.setCharacterSize(charSize);
		m_text.setFillColor(labelColor);

		const sf::FloatRect tb = m_text.getLocalBounds();

		m_background.setSize(
			{ tb.width + 2.f * paddingX, tb.height + 2.f * paddingY });

		m_text.setOrigin(tb.left, tb.top);

		const sf::Vector2f pos = m_background.getPosition();
		m_text.setPosition(pos.x + paddingX, pos.y + paddingY);
	}

	const float paddingX = 2.f;
	const float paddingY = 2.f;

	std::function<void()> m_onClick;
	sf::RectangleShape m_background;
	sf::Text m_text;
};

#endif // CG_BUTTON_H
