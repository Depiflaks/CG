//
// Created by smmm on 2/23/26.
//

#ifndef CG_POPUP_H
#define CG_POPUP_H

#include "button.h"
#include "callback.h"
#include "font.h"
#include "sfml_core.h"

#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/Text.hpp>

namespace sfml_core
{

class Popup : public Widget
{
public:
	Popup(const sf::Vector2f& size,
		const std::string& caption,
		sf::Color captionColor,
		SimpleCallback closeWindow,
		SimpleCallback nextGame)
		: Widget({}, size)
		, m_caption(caption)
		, m_captionColor(captionColor)
		, m_closeButton(std::move(closeWindow), "Exit", sf::Color::Black, 16)
		, m_nextGameButton(std::move(nextGame), "Next", sf::Color::Black, 16)
	{
		BuildStatic();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states)
	{
		EnsureLayout(target.getSize());
		target.draw(m_background, states);
		target.draw(m_title, states);
		m_closeButton.Draw(target, states);
		m_nextGameButton.Draw(target, states);
	}

private:
	void BuildStatic()
	{
		m_background.setSize(Bounds());
		m_background.setFillColor(sf::Color(150, 150, 150));
		m_background.setOutlineThickness(2.f);
		m_background.setOutlineColor(sf::Color::Black);

		m_font = loadFont();
		m_title.setFont(m_font);
		m_title.setString(m_caption);
		m_title.setCharacterSize(28);
		m_title.setFillColor(m_captionColor);

		const sf::FloatRect titleBounds = m_title.getLocalBounds();
		m_title.setOrigin(titleBounds.left + titleBounds.width / 2.f,
			titleBounds.top + titleBounds.height / 2.f);
	}

	void EnsureLayout(sf::Vector2u windowSize)
	{
		if (m_lastWindowSize == windowSize)
			return;

		m_lastWindowSize = windowSize;

		const sf::Vector2f pos((windowSize.x - Bounds().x) / 2.f,
			(windowSize.y - Bounds().y) / 2.f);

		m_background.setPosition(pos);

		m_title.setPosition(
			Position().x + Bounds().x / 2.f, Position().y + 40.f);

		const float gap = 20.f;
		const float bottomMargin = 20.f;

		const sf::Vector2f leftSize = m_closeButton.Position();
		const sf::Vector2f rightSize = m_nextGameButton.Position();

		const float y = pos.y + Bounds().y - bottomMargin
			- std::max(leftSize.y, rightSize.y);
		const float midX = pos.x + Bounds().x / 2.f;

		const float leftX = midX - gap / 2.f - leftSize.x;
		const float rightX = midX + gap / 2.f;

		m_closeButton.SetPosition({ leftX, y });
		m_nextGameButton.SetPosition({ rightX, y });
	}

	std::string m_caption;
	sf::Color m_captionColor;

	mutable sf::Vector2u m_lastWindowSize{ 0u, 0u };

	mutable sf::RectangleShape m_background{};
	sf::Font m_font{};
	sf::Text m_title{};

	mutable Button m_closeButton;
	mutable Button m_nextGameButton;
};

} // namespace sfml_core
#endif // CG_POPUP_H
