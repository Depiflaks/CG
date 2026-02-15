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
	using onClickCallback = std::function<void()>;

	Button(const sf::Vector2f& position, const sf::Vector2f& size,
		onClickCallback onClick, const std::string& label, sf::Color labelColor,
		uint charSize)
		: Widget(position, size)
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
		target.draw(m_background);
		target.draw(m_text);
	}

private:
	void Build(const std::string& label, sf::Color labelColor, uint charSize)
	{
		m_font = core::loadFont();
		m_text.setFont(m_font);
		m_text.setString(label);
		m_text.setCharacterSize(charSize);
		m_text.setFillColor(labelColor);

		const sf::FloatRect tb = m_text.getLocalBounds();
		SetBounds({ tb.width + 2.f * paddingX, tb.height + 2.f * paddingY });

		m_background.setSize({ Bounds().x, Bounds().y });
		m_background.setPosition(Position().x, Position().y);
		m_background.setOutlineColor(sf::Color::Black);
		m_background.setOutlineThickness(1.f);

		m_text.setOrigin(tb.left, tb.top);
		const sf::Vector2f pos = m_background.getPosition();
		m_text.setPosition(pos.x + paddingX, pos.y + paddingY);
	}

	const float paddingX = 5.f;
	const float paddingY = 5.f;

	onClickCallback m_onClick;
	sf::RectangleShape m_background;
	sf::Text m_text;
	sf::Font m_font;
};

#endif // CG_BUTTON_H
