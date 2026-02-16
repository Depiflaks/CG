//
// Created by smmm on 2/15/26.
//

#ifndef CG_POPUP_H
#define CG_POPUP_H
#include "sfml_core/font.h"
#include "sfml_core/sfml_core.h"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Text.hpp>

class Popup : public sfml_core::Widget
{
public:
	Popup(const sf::Vector2f& position, const sf::Vector2f& size,
		const std::string& caption, sf::Color captionColor)
		: Widget(position, size)
	{
		Build(caption, captionColor);
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) const
	{
		target.draw(m_background);
		target.draw(m_title);
		// TODO: рисование 2х кнопок
	}

private:
	void Build(const std::string& caption, sf::Color captionColor)
	{
		m_background.setSize(Bounds());
		m_background.setPosition(Position());
		m_background.setFillColor(sf::Color(40, 40, 40, 230));
		m_background.setOutlineThickness(2.f);
		m_background.setOutlineColor(captionColor);

		sf::Text text;
		m_font = sfml_core::loadFont();
		m_title.setFont(m_font);
		m_title.setString(caption);
		m_title.setCharacterSize(28);
		m_title.setFillColor(sf::Color::White);

		const sf::FloatRect titleBounds = m_title.getLocalBounds();
		m_title.setOrigin(titleBounds.left + titleBounds.width / 2.f,
			titleBounds.top + titleBounds.height / 2.f);

		m_title.setPosition(
			Position().x + Bounds().x / 2.f, Position().y + 40.f);
	}

	sf::RectangleShape m_background{};
	sf::Font m_font{};

	sf::Text m_title{};
};

#endif // CG_POPUP_H
